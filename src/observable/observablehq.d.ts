// Le runtime et la bibliothèque standard d'Observable ne publient pas de types.
declare module "@observablehq/runtime" {
  export const Runtime: any;
  export const Library: any;
}
