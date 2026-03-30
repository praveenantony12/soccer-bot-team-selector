import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {

  private readonly BASE_URL = '';
  players: string[] = [];
  filteredPlayers: string[] = [];
  selected = new Set<string>();
  currentPlayers: string[] = [];
  loading = false;
  success = false;
  initialLoading = false;
  currentLoading = false;
  searchTerm = '';
  isAdmin = false;
  private adminKey = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  private normalizePlayers(input: unknown): string[] {
    if (Array.isArray(input)) {
      return input.filter((player): player is string => typeof player === 'string');
    }

    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
          return parsed.filter((player): player is string => typeof player === 'string');
        }
      } catch {
        return [];
      }
    }

    return [];
  }

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    this.adminKey = params.get('admin') || '';
    if (this.adminKey) {
      this.http.get<{ valid: boolean }>(`${this.BASE_URL}/api/admin/verify`, {
        headers: { 'x-admin-key': this.adminKey }
      }).subscribe({
        next: (res) => { this.isAdmin = res.valid === true; this.cdr.detectChanges(); },
        error: () => { this.isAdmin = false; }
      });
    }
    this.loadPlayers();
    this.loadCurrent();
  }

  loadPlayers() {
    this.initialLoading = true;
    this.http.get<string[]>(`${this.BASE_URL}/api/players`).subscribe({
      next: (res) => {
        this.players = res || [];
        this.filteredPlayers = res || [];
        this.initialLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.initialLoading = false;
      }
    });
  }

  loadCurrent() {
    if (this.currentLoading) return;
    this.currentLoading = true;
    this.http.get<unknown>(`${this.BASE_URL}/api/current`).subscribe({
      next: (res) => {
        this.currentPlayers = this.normalizePlayers(res);
        this.currentLoading = false;
        this.updateAvailablePlayers();
        this.cdr.detectChanges();
      },
      error: () => {
        this.currentLoading = false;
      }
    });
  }

  updateAvailablePlayers() {
    // Filter out current players from available list
    const available = this.players.filter(player => 
      !this.currentPlayers.includes(player)
    );
    
    // Update filtered players to reflect available players
    if (!this.searchTerm.trim()) {
      this.filteredPlayers = available;
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredPlayers = available.filter(player =>
        player.toLowerCase().includes(searchLower)
      );
    }
    this.cdr.detectChanges();
  }

  filterPlayers() {
    this.updateAvailablePlayers();
  }

  toggle(name: string) {
    this.selected.has(name) ? this.selected.delete(name) : this.selected.add(name);
  }

  submit() {
    if (this.selected.size === 0) return;

    this.loading = true;
    this.success = false;

    const names = Array.from(this.selected);
    this.http.post(`${this.BASE_URL}/api/join`, { names }).subscribe({
      next: () => {
      this.loading = false;
      this.success = true;
      this.selected.clear();
      this.loadCurrent();
      setTimeout(() => {
        this.success = false;
      }, 3000);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  leave(name: string) {
    this.http.post(`${this.BASE_URL}/api/leave`, { name }, {
      headers: { 'x-admin-key': this.adminKey }
    }).subscribe({
      next: () => {
        this.loadCurrent(); // This will call updateAvailablePlayers()
        // If player was selected, remove from selection
        this.selected.delete(name);
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }
}