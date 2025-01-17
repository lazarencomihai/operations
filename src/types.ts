import { z } from 'zod';
import {
  apiMetadataSchema,
  apiSchema,
  beaconSchema,
  beaconsSchema,
  chainsMetadataSchema,
  deploymentSetSchema,
  deploymentsSchema,
  extendedChainDescriptionSchema,
  oisesSchema,
  operationsRepositorySchema,
  secretsSchema,
  templateSchema,
  topUpWalletSchema,
  templatesSchema,
  walletTypeSchema,
} from './utils/validation';

export type Beacon = z.infer<typeof beaconSchema>;
export type Beacons = z.infer<typeof beaconsSchema>;
export type DeploymentSet = z.infer<typeof deploymentSetSchema>;
export type Deployments = z.infer<typeof deploymentsSchema>;
export type Template = z.infer<typeof templateSchema>;
export type Templates = z.infer<typeof templatesSchema>;
export type Oises = z.infer<typeof oisesSchema>;
export type ApiMetadata = z.infer<typeof apiMetadataSchema>;
export type Api = z.infer<typeof apiSchema>;
export type ChainsMetadata = z.infer<typeof chainsMetadataSchema>;
export type Secrets = z.infer<typeof secretsSchema>;
export type TopUpWalletSchema = z.infer<typeof topUpWalletSchema>;
export type WalletType = z.infer<typeof walletTypeSchema>;
export type ExtendedChainDescription = z.infer<typeof extendedChainDescriptionSchema>;

export type OperationsRepository = z.infer<typeof operationsRepositorySchema>;
