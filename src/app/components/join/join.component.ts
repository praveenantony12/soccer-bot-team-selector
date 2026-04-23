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

  // Token modal state (shown after join)
  showTokenModal = false;
  removalToken = '';
  tokenCopied = false;
  modalConfirmed = false;

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
    // Add cache-busting timestamp to prevent browser caching
    const timestamp = new Date().getTime();
    this.http.get<unknown>(`${this.BASE_URL}/api/current?_t=${timestamp}`).subscribe({
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

  // Force reload that bypasses the loading guard - used after join/leave
  forceLoadCurrent() {
    this.currentLoading = false; // Reset loading flag
    this.loadCurrent();
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
    this.http.post<{ success: boolean; added: number; token?: string }>(`${this.BASE_URL}/api/join`, { names }).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = true;
        this.selected.clear();
        // Small delay to ensure backend has processed the join
        setTimeout(() => this.forceLoadCurrent(), 300);

        // Show token modal for single-player joins (when token is returned)
        if (res.token && names.length === 1) {
          this.removalToken = res.token;
          this.showTokenModal = true;
          this.tokenCopied = false;
          this.modalConfirmed = false;
        } else {
          // Multi-player join - auto-hide success after 3 seconds
          setTimeout(() => {
            this.success = false;
          }, 3000);
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  leave(name: string) {
    this.http.post(`${this.BASE_URL}/api/leave`, { name }, {
      headers: { 'x-admin-key': this.adminKey }
    }).subscribe({
      next: () => {
        // If player was selected, remove from selection
        this.selected.delete(name);
        // Force reload with delay to ensure backend has processed
        setTimeout(() => this.forceLoadCurrent(), 300);
      },
      error: () => {}
    });
  }

  // Unified removal handler - admin removes directly, others need token
  onRemoveClick(name: string) {
    if (this.isAdmin) {
      // Admin can remove anyone directly
      this.leave(name);
    } else {
      // Non-admin needs to provide removal token
      this.showRemovalTokenModal(name);
    }
  }

  // Removal Token Modal (for self-removal via chip X button)
  showRemovalModal = false;
  removalModalPlayer = '';
  removalModalToken = '';
  removalModalError = '';
  removalModalLoading = false;

  showRemovalTokenModal(playerName: string) {
    this.removalModalPlayer = playerName;
    this.removalModalToken = '';
    this.removalModalError = '';
    this.removalModalLoading = false;
    this.showRemovalModal = true;
    this.cdr.detectChanges();
  }

  closeRemovalTokenModal() {
    this.showRemovalModal = false;
    this.removalModalPlayer = '';
    this.removalModalToken = '';
    this.removalModalError = '';
    this.cdr.detectChanges();
  }

  submitRemovalToken() {
    if (!this.removalModalToken) {
      this.removalModalError = 'Please enter your removal code.';
      this.cdr.detectChanges();
      return;
    }

    this.removalModalLoading = true;
    this.removalModalError = '';

    this.http.post<{ success: boolean; message?: string }>(`${this.BASE_URL}/api/remove-self`, {
      name: this.removalModalPlayer,
      token: this.removalModalToken.toUpperCase()
    }).subscribe({
      next: (res) => {
        this.removalModalLoading = false;
        this.showRemovalModal = false;
        // If player was selected, remove from selection
        this.selected.delete(this.removalModalPlayer);
        this.forceLoadCurrent();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.removalModalLoading = false;
        this.removalModalError = err.error?.error || 'Invalid removal code. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  // Token Modal Methods
  copyToken() {
    if (this.removalToken) {
      navigator.clipboard.writeText(this.removalToken).then(() => {
        this.tokenCopied = true;
        this.cdr.detectChanges();

        // Reset copied status after 2 seconds
        setTimeout(() => {
          this.tokenCopied = false;
          this.cdr.detectChanges();
        }, 2000);
      }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = this.removalToken;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        this.tokenCopied = true;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.tokenCopied = false;
          this.cdr.detectChanges();
        }, 2000);
      });
    }
  }

  confirmModal() {
    this.modalConfirmed = true;
    this.showTokenModal = false;
    this.success = false;
    this.cdr.detectChanges();
  }

  closeModal() {
    // Only allow closing if confirmed
    if (this.modalConfirmed) {
      this.showTokenModal = false;
      this.success = false;
      this.cdr.detectChanges();
    }
  }

}