// Bloc C · rouge tant que ProcessedEvents n'est pas complétée.
import { ProcessedEvents } from '../../src/consumers/processed-events';

describe('ProcessedEvents (bloc C)', () => {
  it('ne connaît aucun événement au départ', () => {
    expect(new ProcessedEvents().has('evt-1')).toBe(false);
  });

  it('se souvient d\'un événement ajouté', () => {
    const processed = new ProcessedEvents();
    processed.add('evt-1');
    expect(processed.has('evt-1')).toBe(true);
  });

  it('ne confond pas deux événements différents', () => {
    const processed = new ProcessedEvents();
    processed.add('evt-1');
    expect(processed.has('evt-2')).toBe(false);
  });
});
