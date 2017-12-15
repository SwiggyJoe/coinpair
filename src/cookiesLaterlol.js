import Cookies from 'universal-cookie';

const cookies = new Cookies();

cookies.remove('user', {user: "test", password: "lol"}, { path: '/' });
console.log(cookies.get('user')); // Pacman
