import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationService } from '../../services/configuration-service';
import { FeatureName, FEATURES } from '@test-monorepo/shared-models';

@Component({
  selector: 'app-features',
  imports: [CommonModule],
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features {
  readonly featureList = FEATURES;
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(public config: ConfigurationService) {}

  asFeature = (val: string) => val as FeatureName;
}
