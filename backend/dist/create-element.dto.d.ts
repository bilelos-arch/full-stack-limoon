export declare class CreateElementDto {
    type: 'text' | 'image';
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    textContent?: string;
    font?: string;
    fontSize?: number;
    fontStyle?: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strikethrough?: boolean;
    };
    googleFont?: string;
    color?: string;
    backgroundColor?: string;
    alignment?: 'left' | 'center' | 'right';
    variableName?: string;
    defaultValues?: Record<string, string>;
}
