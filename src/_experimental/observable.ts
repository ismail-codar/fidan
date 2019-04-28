// import symbolObservable from "symbol-observable";

// export const isObservable = value =>
//   Boolean(
//     value && value[symbolObservable] && value === value[symbolObservable]()
//   );

// export const toObservable = <T>(data: FidanValue<any>, Observable): T => {
//   return new Observable(observer => {
//     const cmp = compute(() => {
//       observer.next(data());
//     }, data);
//   }) as any;
// };
