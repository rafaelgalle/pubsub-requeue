## **PUBSUB REQUEUE**

Objetivo deste repositório é encontrar uma maneira de reenfileirar mensagens que tiveram falha em seu processamento, uma alternativa ao repositório de reprocessamento com rabbitmq https://github.com/rafaelgalle/rabbitmq-requeue

Após aplicar reprocessamento com rabbitmq resolvi experimenta-lo com pubsub, um serviço gerenciado pelo google onde não precisamos nos preocupar com escalonamento nem gerenciamento de nada, apesar de serem parecidos, o pubsub não implementa o protocolo amqp como o rabbitmq, então são diferentes apesar de semelhantes.

Para esse exemplo estamos buscando um reprocessamento, um número limitado de tentativas e com um tempo x de espera entre cada repetição.
* Tempo de espera entre repetições
* Número limite de repetições

### **Emulador**
Para evitar criar uma conta no GCP e gerar custos utilizando o PUBSUB, podemos utilizar seu emulador.

Instalando emulador
```gcloud components install pubsub-emulator```

Iniciando emulador
```gcloud beta emulators pubsub start --project=test-emulator-pubsub```

Configurando variaveis para o projeto utilizar emulador
```$(gcloud beta emulators pubsub env-init)```

Mais detalhes sobre como utilizar o emulador estão presentes nesse link
https://cloud.google.com/pubsub/docs/emulator?hl=pt_br#linux-macos

### **Execução**

Após instalar e iniciar o emulador, abra dois terminais e execute a configuração de variavel do emulador em ambos.

```$(gcloud beta emulators pubsub env-init)```

Então em um deles execute o ```createTopics.js``` e no outro o ```createSubscriptions.js```, após criar o topic e sub, em um terminal execute o ```sub.js``` para iniciar o sub e no outro execute o ```pub.js``` para publicar a mensagem, você verá no terminal do sub as tentativas e o tempo de espera entre cada processamento, até que a mensagem seja descartada para fila de cartas mortas.


### **Referencias**
https://medium.com/zendesk-engineering/adding-functionality-to-google-pub-sub-queue-meta-processing-fff15e2d3a2c

https://cloud.google.com/pubsub/architecture?hl=pt-br#data_plane_-_the_life_of_a_message

https://cloud.google.com/pubsub/docs/dead-letter-topics?hl=pt-br

https://cloud.google.com/pubsub/docs/samples/pubsub-publisher-retry-settings?hl=pt-br

https://cloud.google.com/pubsub/docs/publisher
