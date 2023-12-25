
exports.up = function(knex) {
    const now = new Date();
 
   return knex('account').insert([
       {
           firstName: 'Jabari',
           lastName: 'Holloway',
           email: 'jabari@jabariholloway.com',
           passwordHash: 'placeholder',
           tdaAccountId: '237055806',
           tdaAuthToken: 'vuHE1FQM07/yNBjmuiGa93dUOnd5IpRsFjzu1e4Old6PnbCKQJPWQoXPiRAzrzm6VNu7Di84rx/6D1c0X4WCZG7L3STPihop9YycimRTZvDjj97eRPH53ZvLHmlb1IeFdJqdWIVUUc+eXZiLcZsDIVdBImTKwLRkvg21EyRZOScxl2PAov6q3Wof2BG/T3axjpN+Rjmb8V8sFGZl3Xpq7ftlH0kOCHE2vLVIjFKkIjHjv/uXzulGo+Tx9+uXbynDywCUCtwLvfT58GhiwqICRbHKDkMPsi/+UxYNGRiqYdxPSDZSc0YPXR/wugQ8jhj5JpOoKEEXAxaoqYpf/ZTD8cb7thiccFOgiplSNR+dOPxZbJeFFamhokZv2mfrlqv7SJfC5nwDtGLu94OlPkUN2VcfJ6SXxCeawTP2+K3HSgDKMKXHImezpH19cd0elp3EqgwKB7BJN7NEqIfQvGYtchAsO4T03OpGhcRfaWN+XBMwm3twFLPy+tfxijJvWFKkRHbynZ3zbVRonHT6Jy6Ihpdfh7iG7qXhwwQZOU1GThbti9GvR100MQuG4LYrgoVi/JHHvlCn4kBF6rho3Dx8aln318REovLsm3pKJ13lPfMYk4shmu7+8u6Wjl2BeJgJsLOrqPiBChOsWwi2anGx33inMhYExe4tGmItx0fQvjsvRA6q5PhIZVOD57wfAc969upwlmvdyg0DsR5CsUsGYI6ekcczg4O10a31PjVANJaewsCCtuAigQqWKEFTYmt6rOYc6eKUAMhJXimGVZMaWaPWow4qWtBe5zdAlnWu2ZCQtSmMyVT+MOcSbZyGPqjqOcqWLwLTKUxInWRNVhWBD4tH8P513js3K5BdoaQb/Do23P7eLfasyUVGFChIpCBBkF8zC6cXRse4qR/4c6dprG/G6jICrgBbx2w7zSHM/3CmGNVdJWzrCOEFe9u8J/iCsvPWCVkRJsHMFDl8XaqHMDfQBKHrDm0ZoAEpKmpswFEdqwSQxHEU2A+U6EX8DwqVKLCaBMG/4lyx4AvBo3Ni45DCQKRFxOf9wYuc+dGWL0hLv+A6P9t92h1cnbyUG9rS7MbvnWEKXQnUKpEeE2TJWItYYIZGgKOjWdwCx8oPevVQPz1oZpwxng==212FD3x19z9sWBHDJACbC00B75E',
           tdaRefreshToken: 'oMNXW+2GqcaB9hi8V4RgQTEV1FMReIgYI8j/IDy+0A7VrXNDiWTb0EecOJyrS78Xevvg/YF8boF1CC0FDclA3ALhkI3ddjP3ECJR7fDYB2pc7P69OTcJsb4EY6kBJdxoF/wRofU21sRfDjxBqFFr/Zur1Ri24ZpbeQPivDDwrBqtEBQ8SNMStJ+lnbFs+VDDuJvNHMqvzBcxcvv/2Wr5H8zzk762akumIrPwu1+VfwyCgKI+lH+qK690AQ7lfIs239RgIVlq+fbpmFyjp5XFG0C6byu/DPZpCdrFYXDLPB7LQnRFA3qkQOyOqDG6YMmNMSwsC1naddiK4tmClb2EjBlW+Z3+H+tIZaK98JulN+H4HWPMKEztu5MIgv5frAwloqHKEQSra/+78zAftp4DEh+qNJrMHD1luI3IUGuhT1VNsT0WMAyqFLyg42N100MQuG4LYrgoVi/JHHvl0rN7sUa3LWdlf3ha2Zs+fmakpVLwxPpSjb1xWA5sG5LZ+MsR5bYng9qx1cx2mrYOippMFzxT3ot3fjthX8ZSj2HJyn3cEW/BqRO1w3Z7QDx8AfamXFugXe7BBdkMHSbFy9FFvPxBQw/VOBtUehH1sj6GRnU0ZGMgA2JBUebtmkeZv91JG+9x/b/B1oz8W4GitC9p/39BuXpw2SNo/D/FhaQP0jSqA+YirfldYBpZ02IRH7p6/kOqZgrRfsJhZPE7DfvS/kAaU7jaX/bzxGqVvKtSGM1RG/fxxkcbDwor/R5mOF+kcRUkLqrrCGChVoYBcsM7vy3Q4wdnnSwdS+hHCAwzxAiabAZfYeSnKPrdExhVKK1h0UqyOns3oxme9d5D1zJerywZ9wyCk2+AlYkA/ARUNmbYP5xVzAgVg4A9EG/R32AHVAxf0zHYlD8=212FD3x19z9sWBHDJACbC00B75E',
           createdAt: now,
           updatedAt: now
       }
   ]);
};

exports.down = function(knex) {
    return knex('account').del().where({ email: 'jabari@jabariholloway.com' });
};
