export type TestInput = {
    regex: string;
    replacement: string;
    input: string[];
};

export type TestOutput = {
    success: boolean;
    html: string;
    message: string;
};
