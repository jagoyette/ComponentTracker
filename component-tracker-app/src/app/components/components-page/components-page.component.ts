import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ComponentTrackerApiService } from '../../services/component-tracker-api.service';
import { ComponentModel } from '../../models/component-model';
import { ComponentDetailComponent } from '../component-detail/component-detail.component';

import { ServiceInterval } from '../../models/service-interval';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-components-page',
  standalone: true,
  imports: [ComponentDetailComponent, NgFor, NgIf, FormsModule, MatButtonModule, MatTableModule, MatInputModule, MatFormFieldModule],
  templateUrl: './components-page.component.html',
  styleUrl: './components-page.component.scss'
})
export class ComponentsPageComponent implements OnInit {

  constructor (private apiService: ComponentTrackerApiService) {}

  displayedColumns: string[] = ['category', 'name', 'select', 'delete'];

  public myComponents : ComponentModel[] = [];
  public selectedComponent: ComponentModel | undefined;
  public newComponent: ComponentModel | undefined;
  public serviceInterval: ServiceInterval = {
    id: "",
    name: "MaxLife",
    description: "Maximum lifetime of component",
    distance: 0
  };


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

  onAdd(component: ComponentModel): void {
    this.apiService.createComponent(component).subscribe(data => {
      // update our local list
      this.myComponents.push(data);

      // Current component becomes just added one
      this.selectedComponent = data;
      this.newComponent = undefined;
    });
  }

  onAddComponent(): void {
    this.newComponent = new ComponentModel();
    this.newComponent.installDate = new Date();
    this.newComponent.isInstalled = true;

    // Insert a service interval
    this.newComponent.serviceIntervals = [this.serviceInterval];
    this.selectedComponent = undefined;
  }


}
