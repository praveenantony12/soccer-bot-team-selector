// In-memory storage for current game participants
let currentPlayers: string[] = [];

export function addPlayer(name: string): void {
  if (!currentPlayers.includes(name)) {
    currentPlayers.push(name);
  }
}

export function removePlayer(name: string): void {
  currentPlayers = currentPlayers.filter(p => p !== name);
}

export function getPlayers(): string[] {
  return [...currentPlayers];
}

export function clearPlayers(): void {
  currentPlayers = [];
}

export function getPlayerCount(): number {
  return currentPlayers.length;
}
