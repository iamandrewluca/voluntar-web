import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RequestsFacadeService } from '@services/requests/requests-facade.service';
import { map, takeUntil, switchMap, tap, filter } from 'rxjs/operators';
import { Subject, of, EMPTY, concat } from 'rxjs';
import { IRequestDetails } from '@models/requests';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { TagsFacadeService } from '@services/tags/tags-facade.service';

@Component({
  selector: 'app-request-details',
  templateUrl: './request-details.component.html',
  styleUrls: ['./request-details.component.scss']
})
export class RequestDetailsComponent implements OnInit, OnDestroy {
  statusOptions = [
    {
      label: 'New',
      value: 'new'
    },
    {
      label: 'Done',
      value: 'done'
    },
    {
      label: 'On Progress',
      value: 'onprogress'
    },
    {
      label: 'Review',
      value: 'review'
    }
  ];

  form = this.fb.group({
    _id: [null],
    first_name: [null, Validators.required],
    last_name: [null, Validators.required],
    email: [null, [Validators.required, Validators.email]],
    password: [{ value: 'random', disabled: true }, Validators.required],
    phone: [null, [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
    is_active: [false, Validators.required],
    address: [null, Validators.required],
    zone_address: [null, Validators.required],
    age: [null, [Validators.required, Validators.max(120)]],
    activity_types: [[], Validators.required],
    have_money: [false, Validators.required],
    comments: [null, Validators.required],
    questions: [null, Validators.required],
    status: [{ value: 'new', disabled: true }, Validators.required],
    secret: [null, Validators.required],
    availability_volunteer: [null, [Validators.required, Validators.min(0), Validators.max(23)]],
  });
  currentRequestId: string;

  activityTypes$ = this.tagsFacade.activityTypesTags$;
  isLoading$ = concat(this.requestsFacade.isLoading$, this.tagsFacade.isLoading$);
  error$ = concat(this.requestsFacade.error$, this.tagsFacade.error$);

  componentDestroyed$ = new Subject();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private requestsFacade: RequestsFacadeService,
    private tagsFacade: TagsFacadeService
  ) {
    this.route.paramMap
      .pipe(
        map(params => params.get('id')),
        tap(id => (this.currentRequestId = id)),
        tap(id => {
          if (id) {
            this.form.get('password').disable();
            this.form.get('status').enable();
          } else {
            this.form.get('password').enable();
            this.form.get('status').disable();
          }
        }),
        tap(id => id && this.requestsFacade.getRequestById(id)),
        switchMap(id => {
          if (id) {
            return this.requestsFacade.requestDetails$;
          }
          return of({} as IRequestDetails);
        }),
        switchMap(request => request ? of(request) : EMPTY),
        takeUntil(this.componentDestroyed$)
      )
      .subscribe(request => {
        this.form.patchValue(request);
      });
  }

  activityChange({ checked, source }: MatCheckboxChange) {
    const activityTypesValue = this.form.get('activity_types').value;
    if (checked) {
      this.form.get('activity_types').setValue([...activityTypesValue, source.value]);
    } else {
      const filteredActivities = activityTypesValue.filter((id: string) => id !== source.value);
      this.form.get('activity_types').setValue(filteredActivities);
    }
  }

  isActivitySelected(activityId: string) {
    return this.form.get('activity_types').value.includes(activityId);
  }

  ngOnInit() {
    this.tagsFacade.getActivityTypesTags();
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  onSubmit() {
    if (this.form.valid) {
      this.requestsFacade.saveRequest(this.form.getRawValue());
    } else {
      console.log('Invalid form', this.form);
    }
  }
}
