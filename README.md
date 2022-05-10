# SmartHut - frontend
SA4 Project - Sphinx Team

This is our smart home appilcation, built with React and running on port 3000 (cannot be changed as of now because of CORS policy).

You will **need** to ask the environment file (`sh_envfile`) to a team leader to pass the settings to the containers.


## Using our premade Docker image
A public Docker image is available on the Docker repository under 
[steeven9/sa4-sphinx-frontend](https://hub.docker.com/repository/docker/steeven9/sa4-sphinx-frontend).

The easiest way to use it is to run `docker-compose up`.\
This will pull and spin up frontend (on port 3000), [backend](https://lab.si.usi.ch/sa4-2020/sphinx/backend) (on port 8080)
and a postgres instance (on port 5432).

If you want to run only the frontend, use\
`docker run -it -p 3000:80 --name sphinx-frontend steeven9/sa4-sphinx-frontend`


## Building the project
If you want to build the frontend from scratch, install the dependencies first with\
`yarn install`

then build the static website\
`yarn build`

and finally put everything in a Docker container\
`docker build ./ -t sa4-sphinx-frontend:latest`

that you can run with\
`docker run -it -p 3000:80 --name sphinx-frontend sa4-sphinx-frontend`