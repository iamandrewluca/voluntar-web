import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Demand } from '@demands/shared/demand';

@Component({
  selector: 'app-demands-map-list',
  templateUrl: './demands-map-list.component.html',
})
export class DemandsMapListComponent {
  @Input() demands: Demand[] = [];
  @Output() demandClick = new EventEmitter<Demand>();
}
