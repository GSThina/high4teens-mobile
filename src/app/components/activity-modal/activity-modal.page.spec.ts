import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ActivityModalPage } from './activity-modal.page';

describe('ActivityModalPage', () => {
  let component: ActivityModalPage;
  let fixture: ComponentFixture<ActivityModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
