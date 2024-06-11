import { Component, Input } from '@angular/core';
import { ComponentModel } from '../../models/component-model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-component-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './component-detail.component.html',
  styleUrl: './component-detail.component.scss'
})
export class ComponentDetailComponent {
  @Input() component?: ComponentModel | undefined;

}
