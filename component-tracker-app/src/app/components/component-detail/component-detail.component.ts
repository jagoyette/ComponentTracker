import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentModel } from '../../models/component-model';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-component-detail',
  standalone: true,
  imports: [CommonModule, MatListModule, MatDividerModule, MatCardModule, MatInputModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './component-detail.component.html',
  styleUrl: './component-detail.component.scss'
})
export class ComponentDetailComponent {
  @Input() component!: ComponentModel;
  @Output() onEdit = new EventEmitter();
  @Output() onDelete = new EventEmitter();

  onClickEdit() {
    this.onEdit.emit();
  }

  onClickDelete() {
    this.onDelete.emit();
  }


  getComponentImage() : string {
    const defaultImage = "assets/images/components/sprocket.jpg";

    switch (this.component.category?.toLowerCase()) {
      case "brake":
      case "brakes":
      case "brake pads":  
        return "assets/images/components/brake_pads.jpg"

      case "cassette":
        return "assets/images/components/cassette.jpg"

      case "chain":
        return "assets/images/components/chain.jpg"
            
      case "saddle":
      case "seat":
        return "assets/images/components/saddle.jpg"

      case "tire":
        return "assets/images/components/tire.jpg"
            
      case "wheel":
        return "assets/images/components/wheel.jpg"
        
    }

    return defaultImage;
  }
}
