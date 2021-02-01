import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { from } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import config from '@arcgis/core/config.js';

import { DemandsService } from '../../demands.service';
import { Demand } from '@demands/shared/demand';
import { demandTypes } from '@demands/shared/demand-type';
import { Volunteer } from '@volunteers/shared/volunteer';
import { Coordinate, zones, zonesCoordinates } from '@shared/zone';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

config.assetsPath = '/assets';

const defaultCoordinate: Coordinate = {
  latitude: 47.024758255143986,
  longitude: 28.83263462925968,
};

@Component({
  selector: 'app-demands-map',
  templateUrl: './demands-map.component.html',
  styleUrls: ['./demands-map.component.scss'],
})
export class DemandsMapComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild('map', { static: true }) private mapViewEl: ElementRef;
  mapView: MapView;
  graphicsLayer = new GraphicsLayer();
  demands: Demand[] = [];
  zones = zones;
  demandTypes = demandTypes;
  form = new FormGroup({
    city_sector: new FormControl(''),
    needs: new FormControl(''),
  });
  stepOnSelectionZone = 1;
  selectedDemands: Demand[] = [];
  selectedVolunteer: Volunteer = null;
  selectedCityZone = '';
  selectedDemandTypeFilter = '';
  anyDemand = 'any';
  simpleMarkerSymbol = new SimpleMarkerSymbol({
    color: [255, 255, 255, 0.3],
    style: 'circle',
    outline: {
      color: [226, 119, 40],
      width: 2,
    },
  });
  changedMarkerSymbol = new SimpleMarkerSymbol({
    color: [60, 210, 120, 0.7],
    outline: {
      color: [0, 0, 0, 0.7],
      width: 1,
    },
  });

  constructor(
    private demandsService: DemandsService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): any {
    // Geographic data stored temporarily in memory.
    // Displaying individual geographic features as graphics, visual aids or text on the map.
    this.initializeDemandsOnTheMap('init');
  }

  ngAfterViewInit() {
    this.mapView = new MapView({
      center: [28.825140232956283, 47.01266177894471],
      container: this.mapViewEl.nativeElement,
      zoom: 12,
      map: new Map({
        basemap: 'streets-navigation-vector', // possible: topo-vector
        layers: [this.graphicsLayer],
      }),
    });

    this.mapView.on('click', (ev) => {
      this.mapView.hitTest(ev.screenPoint).then((res) => {
        if (
          res.results.length < 1 || // clicked to no object on the map
          res.results[0].graphic.attributes?.demandId === undefined
        )
          return;

        const gr: Graphic = res.results[0].graphic;
        if (gr) {
          const exist = this.selectedDemands.find(
            (r) => r._id === gr.attributes.demandId,
          );
          if (exist === undefined) {
            //in case of missed - add demand to the selected demands and make it green on map
            this.selectedDemands.push(
              this.demands.find((r) => r._id === gr.attributes.demandId),
            );
            this.selectedDemands = [...this.selectedDemands];
            gr.symbol.set('color', this.changedMarkerSymbol.color);
          } else {
            //in case of exist - remove demand from selected and make it white on map
            this.selectedDemands = this.selectedDemands.filter(
              (r) => r !== exist,
            );
            gr.symbol.set('color', this.simpleMarkerSymbol.color);
          }
          this.graphicsLayer.add(gr.clone());
          this.graphicsLayer.remove(gr);

          //next row needs to proceed detectChanges by Angular
          this.cdr.detectChanges();
        }
      });
      //center map view to selected point
      this.mapView.goTo({ center: ev.mapPoint });
    });
  }

  initializeDemandsOnTheMap(
    status: 'init' | 'filter',
    filters: any = {},
  ): void {
    if (status === 'init') {
      this.selectedDemands = [];
    } else {
      this.graphicsLayer.removeAll();
      this.selectedDemands.forEach((el) =>
        this.addDemandToMap(el, this.changedMarkerSymbol),
      );
    }
    from(
      this.demandsService.getDemands(
        {
          pageIndex: 1,
          pageSize: 20000,
        },
        {
          status: 'confirmed',
          ...filters,
        },
      ),
    ).subscribe(
      (res) => {
        this.demands = res.list;
        this.demands.forEach((el) =>
          this.addDemandToMap(el, this.simpleMarkerSymbol),
        );
      },
      (err) => console.log('Error getting demands from server! ', err),
    );
  }

  addDemandToMap(demand: Demand, symbol: SimpleMarkerSymbol): void {
    if (
      !demand.beneficiary.latitude ||
      !demand.beneficiary.longitude ||
      !demand.beneficiary.zone
    ) {
      throw new Error(`Cannot locate beneficiary: ${demand.beneficiary._id}`);
    }

    this.graphicsLayer.add(
      new Graphic({
        geometry: new Point({
          latitude: demand.beneficiary.latitude,
          longitude: demand.beneficiary.longitude,
        }),
        symbol,
        attributes: {
          demandId: demand._id,
          zone: demand.beneficiary.zone,
        },
      }),
    );
  }

  filterChanged(): void {
    let selectedZone = this.zones[0];
    let currentFilter = {};

    this.selectedCityZone = `${this.form.get('city_sector').value}`;
    this.selectedDemandTypeFilter = `${this.form.get('needs').value}`;

    if (
      this.selectedCityZone &&
      'toate'.normalize() !== this.selectedCityZone.normalize()
    ) {
      selectedZone = this.zones.find(
        (zone) => zone.toLowerCase() === this.selectedCityZone.toLowerCase(),
      );
      const coordinates = zonesCoordinates[selectedZone] ?? defaultCoordinate;
      this.mapView.center = new Point(coordinates);
      currentFilter = { ...currentFilter, zone: selectedZone };
    }
    if (
      this.selectedDemandTypeFilter &&
      this.selectedDemandTypeFilter.normalize() !== this.anyDemand.normalize()
    ) {
      currentFilter = {
        ...currentFilter,
        type: this.selectedDemandTypeFilter,
      };
    }
    this.initializeDemandsOnTheMap('filter', currentFilter);
  }

  selectedVolunteerProvided(ev) {
    this.selectedVolunteer = ev;
  }

  nextFormStep(): void {
    if (this.stepOnSelectionZone === 3) {
      this.stepOnSelectionZone = 1;
      this.initializeDemandsOnTheMap('init');
    } else {
      this.stepOnSelectionZone++;
    }
    switch (this.stepOnSelectionZone) {
      case 2:
        if (this.selectedDemands.length === 0) {
          this.stepOnSelectionZone--;
          this.snackMessage('Please select some demands');
          break;
        }
        break;
      case 3:
        this.assignDemandsToVolunteer();
        break;
      default:
        break;
    }
  }

  onSubmit(ev): void {
    ev.preventDefault();
  }

  assignDemandsToVolunteer() {
    from(
      this.demandsService.assignToVolunteer(
        this.selectedDemands,
        this.selectedVolunteer._id,
      ),
    ).subscribe(
      () => {
        this.stepOnSelectionZone = 3;
      },
      (err) => {
        console.log('error', err.error);
      },
    );
  }

  snackMessage(msg: string) {
    this.snackBar.open(msg, '', {
      duration: 3000,
      panelClass: '', //additional CSS
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  ngOnDestroy() {
    this.mapView?.destroy();
    this.graphicsLayer.destroy();
  }
}
