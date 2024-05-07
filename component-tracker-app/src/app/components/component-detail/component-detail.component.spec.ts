import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentDetailComponent } from './component-detail.component';

describe('ComponentDetailComponent', () => {
  let component: ComponentDetailComponent;
  let fixture: ComponentFixture<ComponentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComponentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
