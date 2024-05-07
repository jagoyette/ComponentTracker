import { Component, OnInit } from '@angular/core';
import { ComponentTrackerApiService } from '../../services/component-tracker-api.service';
import { ComponentModel } from '../../models/component-model';
import { ComponentDetailComponent } from '../component-detail/component-detail.component';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-components-page',
  standalone: true,
  imports: [ComponentDetailComponent, NgFor, NgIf, FormsModule],
  templateUrl: './components-page.component.html',
  styleUrl: './components-page.component.css'
})
export class ComponentsPageComponent implements OnInit {

  constructor (private apiService: ComponentTrackerApiService) {}

  public myComponents : ComponentModel[] = [];
  public selectedComponent: ComponentModel | undefined;
  public newComponent: ComponentModel | undefined;


  ngOnInit(): void {
    this.getMyComponents();
  }

  getMyComponents(): void {
    this.apiService.getMyComponents().subscribe(data => {
      this.myComponents = data;
    });
  }

  onSelect(component: ComponentModel): void {
    this.selectedComponent = component;
  }

  onDelete(component: ComponentModel): void {
    if (component.id) {
      this.apiService.deleteComponent(component.id)
        .subscribe(data => {
          // just delete item from our array instead of re-querying
          this.myComponents = this.myComponents.filter(m => m.id !== component.id);

          // Remove selected item if we just deleted it
          if (this.selectedComponent?.id === component.id) {
            this.selectedComponent = undefined;
          }
        });
    }
  }

  onAddComponent(): void {
    this.newComponent = new ComponentModel();
    this.newComponent.installDate = new Date();
    this.newComponent.isActive = true;

    this.selectedComponent = undefined;
  }

  onAdd(component: ComponentModel): void {
    this.apiService.createComponent(component).subscribe(data => {
      // update our local list
      this.myComponents.push(data);

      // Current component becomes just added one
      this.selectedComponent = data;
      this.newComponent = undefined;
    });
  }
}
