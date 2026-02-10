using System;

var hash = BCrypt.Net.BCrypt.HashPassword("Admin123@", workFactor: 12);
Console.WriteLine(hash);
