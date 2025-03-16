export interface FileWriter {
  write(row: string): Promise<void>;
}
