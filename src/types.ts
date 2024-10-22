import { type runTestFn } from '@regexplanet/common'

export type getVersionFn = () => { [key: string]: string };

export type serverProps = {
    engineCode: string;
    engineRepo: string;
    engineName: string;
    getVersion: getVersionFn;
    runTest: runTestFn;
};

export type serverFn = (props: serverProps) => void;
