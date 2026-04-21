import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VoiceSearchService {
  isListening = signal(false);

  isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  startListening(): Observable<string> {
    const SR = (window as any)['SpeechRecognition'] || (window as any)['webkitSpeechRecognition'];
    return new Observable(observer => {
      const recognition = new SR();
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;
      recognition.continuous = false;
      this.isListening.set(true);

      recognition.onresult = (event: any) => {
        const transcript: string = event.results[0][0].transcript;
        this.isListening.set(false);
        observer.next(transcript);
        observer.complete();
      };

      recognition.onerror = (event: any) => {
        this.isListening.set(false);
        observer.error(event.error);
      };

      recognition.onend = () => {
        this.isListening.set(false);
      };

      recognition.start();

      return () => {
        try { recognition.stop(); } catch (_) {}
        this.isListening.set(false);
      };
    });
  }
}
