# create-fuel-dapp

A CLI tool to bootstrap a Fuel dapp.

## Usage

```bash
$ pnpm create fuel-dapp <project_name>
```

### Run the `fuel-core` node

```bash
$ cd <project_name>
$ make services-run
```

### Build and deploy the contract

```bash
$ cd contract
$ forc deploy --url 0.0.0.0:4000 --unsigned
```

### Run the frontend

```bash
$ cd ../frontend
$ pnpm install
$ pnpm start
```
