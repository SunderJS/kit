import { HttpStatus } from "sunder";

export type Result<T, E = any> = Promise<{
    success: false,
    value: E,
    status: HttpStatus,
} | {
    success: true,
    value: T
}>
