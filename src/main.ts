import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { JoinComponent } from './app/components/join/join.component';

bootstrapApplication(JoinComponent, {
  providers: [provideHttpClient()]
})
  .catch(err => console.error(err));