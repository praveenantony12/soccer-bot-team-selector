import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { finalize, timeout } from 'rxjs/operators';
import { FormationComponent } from './components/formation/formation.component';
import { JoinComponent } from './components/join/join.component';

interface FormationSlot {
  position: {
    x: number;
    y: number;
    label: string;
    code: string;
  };
  player?: {
    name: string;
    rating?: number;
  };
}

interface TeamFormation {
  name: string;
  description: string;
  slots: FormationSlot[];
  bench: Array<{
    name: string;
    rating?: number;
  }>;
}

interface UiStateResponse {
  phase: 'collecting' | 'formed' | 'insufficient';
  minPlayers: number;
  cutoffTimeLabel: string;
  canGenerateNow: boolean;
  message?: string;
  teams?: {
    blueTeam: string[];
    redTeam: string[];
    generatedAt?: string | null;
  };
  formations?: {
    team1: TeamFormation;
    team2: TeamFormation;
  } | null;
}

interface GeneratedTeamsResponse {
  success: boolean;
  teams: {
    team1: {
      players: Array<{ name: string }>;
    };
    team2: {
      players: Array<{ name: string }>;
    };
    formations?: {
      team1: TeamFormation;
      team2: TeamFormation;
    } | null;
    generatedAt?: string;
  };
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, JoinComponent, FormationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  uiState: UiStateResponse | null = null;
  loadingState = false;
  generating = false;
  resetting = false;
  error: string | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    setTimeout(() => this.loadUiState(), 0);
  }

  get isCollecting(): boolean {
    return this.uiState?.phase === 'collecting';
  }

  get isInsufficient(): boolean {
    return this.uiState?.phase === 'insufficient';
  }

  get isFormed(): boolean {
    return this.uiState?.phase === 'formed';
  }

  loadUiState(): void {
    if (this.loadingState) {
      return;
    }

    this.loadingState = true;
    this.http.get<UiStateResponse>('/api/ui-state').pipe(
      timeout(7000),
      finalize(() => {
        this.loadingState = false;
      })
    ).subscribe({
      next: (state) => {
        setTimeout(() => {
          this.uiState = state;
          this.error = null;
          this.cdr.detectChanges();
        }, 0);
      },
      error: () => {
        setTimeout(() => {
          this.error = 'Unable to load UI state. Please refresh.';
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  generateNow(): void {
    if (!this.uiState?.canGenerateNow || this.generating) {
      return;
    }

    this.generating = true;
    this.http.post<GeneratedTeamsResponse>('/api/teams/generate', {}).pipe(
      timeout(7000),
      finalize(() => {
        this.generating = false;
      })
    ).subscribe({
      next: (generated) => {
        const t = generated.teams;
        this.uiState = {
          phase: 'formed',
          minPlayers: this.uiState?.minPlayers ?? 12,
          cutoffTimeLabel: this.uiState?.cutoffTimeLabel ?? '7:30 PM EDT',
          canGenerateNow: this.uiState?.canGenerateNow ?? true,
          teams: {
            blueTeam: t.team1.players.map((player) => player.name),
            redTeam: t.team2.players.map((player) => player.name),
            generatedAt: t.generatedAt || null
          },
          formations: t.formations || null
        };
        this.error = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.error || 'Unable to generate teams right now.';
        this.cdr.detectChanges();
      }
    });
  }

  resetDay(): void {
    if (!this.uiState?.canGenerateNow || this.resetting) {
      return;
    }
    this.resetting = true;
    this.http.post('/api/reset', {}).pipe(
      timeout(7000),
      finalize(() => { this.resetting = false; })
    ).subscribe({
      next: () => { this.loadUiState(); },
      error: () => {
        this.error = 'Unable to reset state.';
        this.cdr.detectChanges();
      }
    });
  }
}
