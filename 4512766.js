const {} = require('zigbee-herdsman-converters/lib/modernExtend');
// Add the lines below
const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const ota = require('zigbee-herdsman-converters/lib/ota');
const tuya = require('zigbee-herdsman-converters/lib/tuya');
const {} = require('zigbee-herdsman-converters/lib/tuya');
const utils = require('zigbee-herdsman-converters/lib/utils');
const globalStore = require('zigbee-herdsman-converters/lib/store');
const e = exposes.presets;
const ea = exposes.access;

const definition = {
    zigbeeModel: ['4512766'],
    model: '4512766', // Update this with the real model of the device (written on the device itself or product page)
    vendor: 'Namron', // Update this with the real vendor of the device (written on the device itself or product page)
    description: 'Namron 16A plug with meter', // Description of the device, copy from vendor site. (only used for documentation and startup logging)
    extend: [],
    fromZigbee: [fz.on_off, fz.metering, fz.electrical_measurement],
    toZigbee: [tz.on_off],
    exposes: [e.power(), e.current(), e.voltage(), e.energy(), e.switch()],
    configure: async (device, coordinatorEndpoint, logger) => {
        const endpoint = device.getEndpoint(1) || device.getEndpoint(3);
        const binds = ['seMetering', 'haElectricalMeasurement', 'genOnOff'];
        await reporting.bind(endpoint, coordinatorEndpoint, binds);
        await reporting.onOff(endpoint);
        // Metering
        await reporting.readEletricalMeasurementMultiplierDivisors(endpoint);
        await reporting.readMeteringMultiplierDivisor(endpoint);
        await reporting.rmsVoltage(endpoint, {min: 10, change: 20}); // Voltage - Min change of 2v
        await reporting.rmsCurrent(endpoint, {min: 10, change: 10}); // A - z2m displays only the first decimals, so change of 10 (0,01)
        await reporting.activePower(endpoint, {min: 10, change: 15}); // W - Min change of 1,5W
        await reporting.currentSummDelivered(endpoint, {min: 300}); // Report KWH every 5min
    },
};

module.exports = definition;
