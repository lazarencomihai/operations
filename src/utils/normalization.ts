import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils';
import { encode } from '@api3/airnode-abi';
import { parse } from 'dotenv';
import { sanitiseFilename } from './filesystem';
import { OperationsRepository, Secrets } from '../types';

export const normalize = (payload: OperationsRepository) => {
  const { chains } = payload;

  const apis = Object.fromEntries(
    Object.entries(payload.apis).map(([_key, api]) => {
      const apiKey = sanitiseFilename(api.apiMetadata.name);

      const beacons = Object.fromEntries(
        Object.entries(api.beacons).map(([_key, beacon]) => {
          const beaconId = keccak256(
            defaultAbiCoder.encode(['address', 'bytes32'], [beacon.airnodeAddress, beacon.templateId])
          );

          return [
            sanitiseFilename(beacon.name),
            {
              ...beacon,
              beaconId,
            },
          ];
        })
      );

      const templates = Object.fromEntries(
        Object.entries(api.templates).map(([_key, value]) => {
          const parameters = encode(value.decodedParameters);
          const templateId = ethers.utils.solidityKeccak256(['bytes32', 'bytes'], [value.endpointId, parameters]);

          return [
            sanitiseFilename(value.name),
            {
              ...value,
              templateId,
              parameters,
            },
          ];
        })
      );

      const ois = Object.fromEntries(
        Object.entries(api.ois).map(([_key, value]) => [sanitiseFilename(`${value.title}-${value.version}`), value])
      );

      const deployments = Object.fromEntries(
        Object.entries(api.deployments).map(([key, value]) => {
          const airnode = Object.fromEntries(
            Object.entries(value.airnode).map(([key, value]) => {
              if (key === 'secrets') {
                const envBuffer = Buffer.from((value as Secrets).content);
                const content = Object.entries(parse(envBuffer))
                  .map(([key, _value]) => key)
                  .concat([''])
                  .join('=""\n');

                return [key, { ...value, content }];
              }

              return [key, value];
            })
          );

          const airkeeper = Object.fromEntries(
            Object.entries(value.airkeeper).map(([key, value]) => {
              if (key === 'secrets') {
                const envBuffer = Buffer.from((value as Secrets).content);
                const content = Object.entries(parse(envBuffer))
                  .map(([key, _value]) => key)
                  .concat([''])
                  .join('=""\n');

                return [key, { ...value, content }];
              }

              return [key, value];
            })
          );
          return [key, { airnode, airkeeper }];
        })
      );

      return [
        apiKey,
        {
          beacons,
          templates,
          ois,
          deployments,
          apiMetadata: api.apiMetadata,
        },
      ];
    })
  );

  const shaHash = require('child_process').execSync('git rev-parse HEAD').toString().trim();

  // TODO break this up
  const documentation = {
    beacons: Object.fromEntries(
      Object.entries(apis)
        .filter(([_key, value]) => value.apiMetadata.active)
        .map(([apiKey, api]) => [
          apiKey,
          Object.entries(api.beacons)
            .filter(([_key, value]) => Object.values(value.chains).filter((chain) => chain.active).length > 0)
            .map(([_, beacon]) => ({
              beaconId: beacon.beaconId,
              name: beacon.name,
              description: beacon.description,
              templateUrl: `https://github.com/api3dao/operations/blob/${shaHash}/data/apis/api3/templates/${
                Object.entries(api.templates).find(([_key, template]) => template.templateId === beacon.templateId)![0]
              }.json`,
              chains: Object.entries(beacon.chains).reduce(
                (acc, [chainName, chain]) => ({
                  ...acc,
                  [chainName]: {
                    airkeeperDeviationThreshold: chain.updateConditionPercentage,
                    airseekerDeviationThreshold: chain.airseekerConfig.deviationThreshold,
                  },
                }),
                {}
              ),
            })),
        ])
        .filter(([_key, value]) => value.length > 0)
    ),
    chains,
  };

  return { apis, documentation, chains } as OperationsRepository;
};

export const emptyObject = (object: any, preserveValueKeys: string[], ignoreNestedKeys: string[]): any => {
  if (Array.isArray(object)) {
    return object.map((value) => {
      if (typeof value === 'object' && !ignoreNestedKeys.includes(value)) {
        return emptyObject(value, preserveValueKeys, ignoreNestedKeys);
      }

      return preserveValueKeys.includes(value) ? object[value] : emptyReturn(object[value]);
    });
  }
  const processedTuples = Object.entries(object).map(([key, value]) => {
    if (typeof value === 'object' && !ignoreNestedKeys.includes(key)) {
      return [key, emptyObject(value, preserveValueKeys, ignoreNestedKeys)];
    }

    return [key, preserveValueKeys.includes(key) ? object[key] : emptyReturn(object[key])];
  });

  return Object.fromEntries(processedTuples);
};

const emptyReturn = (value: any) => {
  switch (typeof value) {
    case 'boolean':
      return false;
    case 'number':
      return 0;
    case 'string':
      return '';
    case 'object':
      if (Array.isArray(value)) return [];
      return {};
    default:
      return null;
  }
};
