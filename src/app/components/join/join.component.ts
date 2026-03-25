import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit, OnDestroy {

  private readonly BASE_URL = 'https://soccer-bot-team-selector.onrender.com';
  players: string[] = [];
  filteredPlayers: string[] = [];
  selected = new Set<string>();
  currentPlayers: string[] = [];
  loading = false;
  success = false;
  initialLoading = false;
  currentLoading = false;
  searchTerm = '';
  private refreshInterval: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    console.log('=== ngOnInit called ===');
    console.log('Component state:', {
      initialLoading: this.initialLoading,
      currentLoading: this.currentLoading,
      players: this.players,
      currentPlayers: this.currentPlayers
    });

    this.loadPlayers();
    this.loadCurrent();

    // Set up interval to refresh current players every 5 seconds
    this.refreshInterval = setInterval(() => {
      console.log('⏰ Interval triggered - calling loadCurrent');
      this.loadCurrent();
    }, 5000);

    console.log('✅ Interval set up');
  }

  ngOnDestroy() {
    // Clean up interval when component is destroyed
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadPlayers() {
    console.log('=== loadPlayers called ===');
    this.initialLoading = true;
    
    this.http.get<string[]>(`${this.BASE_URL}/players`).subscribe({
      next: (res) => {
        console.log('✅ Players loaded:', res.length, 'players');
        this.players = res;
        this.filteredPlayers = res;
        this.initialLoading = false;
        console.log('✅ initialLoading set to false, players:', this.players);
        this.cdr.detectChanges(); // Force UI update
      },
      error: (error) => {
        console.error('❌ Error loading players:', error);
        this.initialLoading = false;
      }
    });
  }

  loadCurrent() {
    if (this.currentLoading) {
      return;
    }
    
    this.currentLoading = true;
    console.log('=== loadCurrent called ===');
    
    this.http.get<string[]>(`${this.BASE_URL}/current`).subscribe({
      next: (res) => {
        console.log('✅ Current players loaded:', res.length, 'players');
        this.currentPlayers = res;
        this.currentLoading = false;
        console.log('✅ currentLoading set to false, currentPlayers:', this.currentPlayers);
        this.updateAvailablePlayers(); // Update available players list
        this.cdr.detectChanges(); // Force UI update
      },
      error: (error) => {
        console.error('❌ Error loading current players:', error);
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

    const calls = Array.from(this.selected).map(name =>
      this.http.post(`${this.BASE_URL}/join`, { name }).toPromise()
    );

    Promise.all(calls).then(() => {
      this.loading = false;
      this.success = true;
      this.selected.clear();
      this.loadCurrent();
      setTimeout(() => {
        this.success = false;
      }, 3000);
    }).catch(() => {
      this.loading = false;
    });
  }

  leave(name: string) {
    this.http.post(`${this.BASE_URL}/leave`, { name }).subscribe({
      next: () => {
        this.loadCurrent(); // This will call updateAvailablePlayers()
        // If player was selected, remove from selection
        this.selected.delete(name);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error leaving game:', error);
      }
    });
  }
}