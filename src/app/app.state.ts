import { AuthState } from '@auth/auth.state';
import { BeneficiariesState } from '@beneficiaries/beneficiaries.state';
import { VolunteersState } from '@volunteers/volunteers.state';
import { DemandsState } from '@demands/demands.state';

export interface AppState {
  auth: AuthState;
  beneficiaries: BeneficiariesState;
  volunteers: VolunteersState;
  demands: DemandsState;
}
