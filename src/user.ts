export class User {
  private _id: string;
  private _email: string;
  private _name: string;
  private _hash: string;
  private _salt: string;

  constructor(id: string, email: string, name: string, hash: string, salt: string) {
    this._id = id;
    this._email = email;
    this._name = name;
    this._hash = hash;
    this._salt = salt;
  }

  public get id(): string {
    return this._id;
  }

  public get email(): string {
    return this._email;
  }

  public get name(): string {
    return this._name;
  }

  public get hash(): string {
    return this._hash;
  }

  public get salt(): string {
    return this._salt;
  }
}
