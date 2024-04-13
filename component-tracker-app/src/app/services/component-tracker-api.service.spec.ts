import { TestBed } from '@angular/core/testing';

import { ComponentTrackerApiService } from './component-tracker-api.service';

describe('ComponentTrackerApiService', () => {
  let service: ComponentTrackerApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentTrackerApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
