# pubsub-requeue
Reprocessamento com pubsub google

Doc do pubsub ta um lixo, tudo sobre reprocessamento é muito vago.

Precisamos de:

  1 - Tempo de espera entre repetições

  2 - Número limite de repetições

Funcionou em retryLimitTime e retryWithDeadLetter

retryLimitTime: (Ruim) Feito manual, ao publicar a mensagem é definido através de um atributo o tempo limite de vida para essa mensagem, e a cada processamento é verificado se esse tempo estourou, ao assinar um topico é informada configuração de retry, que funciona perfeitamente.

retryWithDeadLetter: (Meia boca) Feito manual, ao publicar a mensagem é definido através de um atributo o limite de tentativas, e a cada processamento é verificado se esse limite foi excedido, o deliveryAttemps da mensagem só é incrementado se tem uma deadLetter vinculada, acredito que ao exceder esse limite a mensagem deveria ser entregue a deadLetter e sair da fila atual, mas não é oq acontece, por isso foi necessário fazer a verificação manual para remover essa mensagem da fila.

https://medium.com/zendesk-engineering/adding-functionality-to-google-pub-sub-queue-meta-processing-fff15e2d3a2c
https://cloud.google.com/pubsub/architecture?hl=pt-br#data_plane_-_the_life_of_a_message
https://cloud.google.com/pubsub/docs/dead-letter-topics?hl=pt-br
https://cloud.google.com/pubsub/docs/samples/pubsub-publisher-retry-settings?hl=pt-br

https://cloud.google.com/pubsub/docs/publisher

Procurando algo em issues e comentários

https://github.com/googleapis/nodejs-pubsub/issues/1189
https://github.com/googleapis/nodejs-pubsub/issues/1029
https://gist.github.com/mgabeler-lee-6rs/69a9b0e368d061b1935a7aa428e217b6

Já que não consegui fazer só com retry, fazer também com deadletter (Não funcionou, por algum motivo não aceitou retry + deadletter)

https://cloud.google.com/pubsub/docs/samples/pubsub-publisher-retry-settings


Ou usar atributos da mensagem e contar manualmente o limite (Terei q fazer isso)

// exemplo de topic e sub exists
https://gist.github.com/mgabeler-lee-6rs/69a9b0e368d061b1935a7aa428e217b6