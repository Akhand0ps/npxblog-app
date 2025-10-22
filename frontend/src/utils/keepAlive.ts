// Keep-alive utility to prevent backend cold starts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class KeepAlive {
  private intervalId: number | null = null;
  private isEnabled = false;

  // Ping backend every 14 minutes to keep it warm (Render sleeps after 15 minutes)
  private readonly PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

  start() {
    if (this.isEnabled || import.meta.env.DEV) return; // Don't run in development
    
    this.isEnabled = true;
    console.log('🚀 KeepAlive - Starting backend keep-alive service');
    
    // Initial ping after 1 minute
    setTimeout(() => {
      this.ping();
    }, 60000);
    
    // Regular pings
    this.intervalId = window.setInterval(() => {
      this.ping();
    }, this.PING_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isEnabled = false;
    console.log('🛑 KeepAlive - Backend keep-alive service stopped');
  }

  private async ping() {
    try {
      const response = await fetch(`${API_BASE_URL}/ping`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('💓 KeepAlive - Backend ping successful:', data.timestamp);
      } else {
        console.warn('⚠️ KeepAlive - Backend ping failed:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ KeepAlive - Backend ping error:', error);
    }
  }
}

export const keepAlive = new KeepAlive();

// Auto-start when module loads (only in production)
if (!import.meta.env.DEV) {
  keepAlive.start();
}