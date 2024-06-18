import { Component, Input } from '@angular/core';
import { ComponentModel } from '../../models/component-model';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-component-detail',
  standalone: true,
  imports: [CommonModule, MatListModule, MatDividerModule],
  templateUrl: './component-detail.component.html',
  styleUrl: './component-detail.component.scss'
})
export class ComponentDetailComponent {
  @Input() component?: ComponentModel | undefined;

}
