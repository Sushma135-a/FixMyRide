export class user{
  id!: number|null;
  fullName: string;
  lastName!: string;
  email: string;
  password: string;
  phone: string;

  constructor() {
    this.id = null;
    this.fullName = '';
    this.lastName = '';
    this.email = '';
    this.password = '';
    this.phone = '';
  }

}
