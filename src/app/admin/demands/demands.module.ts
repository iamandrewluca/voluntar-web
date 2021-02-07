import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemandDetailsComponent } from './demand-details/demand-details.component';
import { DemandsListComponent } from './demands-list/demands-list.component';
import { MaterialComponentsModule } from '@shared/material.module';
import { SharedModule } from '@shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { RouterModule } from '@angular/router';
import { demandsRoutes } from './demands.routes';
import { DemandAddressFieldComponent } from './demand-details/demand-address-field/demand-address-field.component';
import { TranslateModule } from '@ngx-translate/core';
import { DemandsMapComponent } from './shared/demands-map/demands-map.component';
import { FilterByNameOrFamilyPipe } from '@app/shared/pipes/filter-by-name-or-family.pipe';
import { TheMapComponent } from '@demands/shared/the-map/the-map.component';
import { DemandsMapListComponent } from '@demands/shared/demands-map/demands-map-list/demands-map-list.component';

@NgModule({
  declarations: [
    DemandDetailsComponent,
    DemandsListComponent,
    DemandAddressFieldComponent,
    DemandsMapComponent,
    DemandsMapListComponent,
    FilterByNameOrFamilyPipe,
    TheMapComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(demandsRoutes),
    MaterialComponentsModule,
    SharedModule,
    NgxMaskModule.forChild(),
    TranslateModule,
  ],
})
export class DemandsModule {}
