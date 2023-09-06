/* eslint-disable */
import {Transformer} from '@parcel/plugin';

/**
 * Parcel plugin to replace ${ENV_VARIABLE} style env variables in JSON files. 
 */
export default new Transformer({
  async transform({asset, options: { env } }) {
    let source = await asset.getCode();
    const manifest = JSON.parse(source);
    const result = JSON.stringify(manifest, (_, value) => {
        if (typeof value === "string") {
            return value.replaceAll(/\$\{([A-Z_]*)\}/g, (match, variableName) => {
                return variableName in env ? env[variableName] : match;
            })
        } else {
            return value;
        }
    });
    asset.setCode(result);
    return [ asset ];
  }
});