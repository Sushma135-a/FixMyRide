export class Admin {
  id!: number|null;
  email!: string;
 password!: string;
 constructor() {
    this.id = null;
    this.email = 'admin@fixmyride.com';
    this.password = 'admin123';
 }
}
