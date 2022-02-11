import { TestBed } from '@angular/core/testing';

import { MyadminService } from './myadmin.service';

describe('MyadminService', () => {
  let service: MyadminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyadminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
