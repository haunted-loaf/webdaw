# WebDaw

A DAW made in web.

## Deploying

### Docker

You can easily deploy the solution using `docker-compose`.  
Here is a sample `docker-compose.yaml`:
```yaml
version: '2.1'

services:
  webdaw:
    # image: custom-repo.tld/user/your-built-image:version
    build: ./path/to/the/source
    ports:
      - 127.0.0.1:80:80 # Will fail if another web server is installed, map another port for reverse proxying or use Docker built-in features
```

### Baremetal

Here are the steps to deploy baremetal.  
You will need `nodejs` to be installed.
```
git clone https://github.com/haunted-loaf/webdaw.git
cd webdaw
npm install
npm run build
```

Now, all you have to do is to copy the content of the `dist/` folder to your webhost.  
For instance, it is `/usr/share/nginx/html` for Nginx.
