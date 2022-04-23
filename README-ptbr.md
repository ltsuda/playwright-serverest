[![API Tests](https://github.com/ltsuda/playwright-serverest/actions/workflows/main.yml/badge.svg)](https://github.com/ltsuda/playwright-serverest/actions/workflows/main.yml) [![README Portuguese](https://img.shields.io/badge/README-Portuguese-blue)](https://github.com/ltsuda/playwright-serverest/blob/main/README-ptbr.md)
[![Badge ServeRest](https://img.shields.io/badge/API-ServeRest-green)](https://github.com/ServeRest/ServeRest/)

# [Playwright ServeRest](https://ltsuda.github.io/playwright-serverest/)

Repositório com objetivo de aprender um novo framework de testes E2E utilizando Microsoft 🎭 Playwright com Javascript

## Sistema em Teste

<a href="https://serverest.dev/">
<img src="https://user-images.githubusercontent.com/29241659/115161869-6a017e80-a076-11eb-9bbe-c391eff410db.png" width=240>
</a>

O servidor REST utilizado neste repositório é um servidor REST API de código aberto feito por [Paulo Gonçalves](https://github.com/PauloGoncalvesBH) para auxiliar os desenvolvedores a aprender sobre testes de API.

## Instalação e Execução

### Requerimentos

-   [git](https://git-scm.com/downloads)
-   [node 14+](https://nodejs.org/en/)
    -   ou use [nvm](https://github.com/nvm-sh/nvm) para gerenciar múltiplas versões do NodeJS
-   Docker (Opcional) para executar os testes em container

#### Clonando o repositório e submódulos

```text
git clone https://github.com/ltsuda/playwright-serverest
```

#### Instalando dependências

```bash
npm install
```

#### Executando os testes

Nesse repositório há múltiplos scripts de testes com diferentes configurações. Veja `package.json/scripts` para saber todas as opções e para ver as configuraçoes do Playwright, veja o arquivo `playwright.config.js`

**Os scripts abaixo foram testados no sistema Ubuntu 20.04/WSL**

Por exemplo:

```bash
# para executar todos os testes de API
npm run test:api

# para executar todos os testes de Esquemas (Schemas)
npm run test:schema

# para executar tanto os testes de API, quanto de Schemas
npm run test:all

# para executar todos os testes com uma tag específica
npx playwright test --grep <tag>
```

Todos os scripts geram os arquivos de resultados utilizando o relatório em formato HTML. Para gerar o relatório, utilize os scripts abaixo:

```bash
npm run reporter:html
# o diretório 'test-results' está configurado no arquivo playwright.config.js
```

Este comando irá iniciar um servidor web com o relatório dos testes, segure CTRL e clique no endereço ou abra o endereço diretamente em um navegador

**Criando imagem docker para execução dos testes**

A imagem `Docker` executa os testes, gerando tambem o relatório de testes e iniciando o servidor web na porta 9323 para a visualização do mesmo

Para criar a imagem e executar todos os testes, execute os seguintes comandos:

```bash
> docker build -f Dockerfile . -t test:docker
# aguarde o download e criação ...

# Para executar o script padrão, utilize o comando abaixo
# O container permanecerá em execução com o servidor web aberto, navegue para o endereço http://localhost para visualizar o relatório dos testes e pressione CTRL+C para desligar o servidor e remover o container
# opcionalmente é possível obter os arquivos de resultados no caso de falhas em alguns testes, basta montar um volume local interligado ao container utilizando o parametro "-v /fullpath:/tester/test-results/"
❯ docker run --rm --ipc=host -p 80:9323 playwright:docker

> playwright-serverest@1.0.0 test:docker
> npx playwright test

[WebServer] event-loop-stats not found, ignoring event loop metrics...

  92 passed (2s)

All tests passed. To open last HTML report run:

  npx playwright show-report


> playwright-serverest@1.0.0 posttest:docker
> npm run reporter:html


> playwright-serverest@1.0.0 reporter:html
> npx playwright show-report test-results


  Serving HTML report at http://127.0.0.1:9323. Press Ctrl+C to quit.

# ou, por exemplo, se deseja alterar o tipo de relatório de teste
# nesse caso, o relatório HTML não será gerado e o servidor do mesmo não será executado
> docker run --rm --ipc=host test:docker npx playwright test --reporter=list
```

## Directory structure

```text
.
├──.github/workflows
├── Dockerfile
├── README.md
├── README-ptbr.md
├── api
│   ├── fixtures.js
│   └── schemas
│       ├── carrinhos.js
│       ├── login.js
│       ├── produtos.js
│       └── usuarios.js
├── package-lock.json
├── package.json
├── playwright.config.js
└── tests
    └── api
        ├── carrinhos.spec.js
        ├── login.spec.js
        ├── produtos.spec.js
        ├── schemas
        │   ├── carrinhos.spec.js
        │   ├── login.spec.js
        │   ├── produtos.spec.js
        │   └── usuarios.spec.js
        └── usuarios.spec.js
```

-   [.github/workflows](https://github.com/ltsuda/playwright-serverest/tree/main/.github/workflows): diretórios com fluxos do Github actions que são executados em todo `push` para `main` ou em todo `pull request` aberto.
    -   [main.yaml](https://github.com/ltsuda/playwright-serverest/blob/main/.github/workflows/main.yml): executa os fluxos de test de api e schema quando aberto um `pull request` ou executa todos os testes quando há evento `push` para `main`, depois é gerado o relatório HTML e disponibilizado no github pages
    -   [docker.yaml](https://github.com/ltsuda/playwright-serverest/blob/main/.github/workflows/docker.yaml): constrói a imagem `Dockerfile`, executa os testes com tags de api e schemas. Este é executado em todo evento `pull request` ou evento `push` para branch `main`
-   [Dockerfile](https://github.com/ltsuda/playwright-serverest/blob/main/Dockerfile): arquivo docker para construir imagem e executar os testes, caso o node não esteja instalado no sistema
-   [api/schemas](https://github.com/ltsuda/playwright-serverest/tree/main/api/schemas): diretório com esquemas de todos os endpoints e utilizando a biblioteca https://joi.dev/
-   [api/pageFixtures.js](https://github.com/ltsuda/playwright-serverest/blob/main/api/fixtures.js): arquivo com funções compartilhadas ([Fixtures](https://playwright.dev/docs/test-fixtures)) que extendem `test` do Playwright para instanciar todos os endpoints e funçoes auxiliares para que cada teste carregue somente o que for necessário
-   [playwright.config.js](https://github.com/ltsuda/playwright-serverest/blob/main/playwright.config.js): arquivo de configuração do Playwright para configurar coisas como a biblioteca de relatório de resultado, quantos `workers` a serem utilizados e como instanciar o servidor REST
-   [tests/api](https://github.com/ltsuda/playwright-serverest/tree/main/tests/api): diretório contendo todos os arquivos de testes de API, incluindo o diretório de teste de schemas
-   [tests/api/schema](https://github.com/ltsuda/playwright-serverest/tree/main/tests/api/schemas): diretório com todos os arquivos de teste de schemas
