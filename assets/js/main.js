new Vue({
    el: '#app',
    data: {
        cidade: '',
        previsoes: [],
        previsoesPorDia: [],
        detalhesDia: [],
        apiKey: 'bf5174385ffed4918d649f3b4bf411fe'
    },
    methods: {
      // Método para obter previsão por nome de cidade
          async obterPrevisao() {
            const cidadeFormatada = this.cidade.trim();
        
            try {
                const resposta = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cidadeFormatada}&appid=${this.apiKey}&units=metric&lang=pt_br`);
                if (resposta.status === 200) {
                    const dados = await resposta.json();
                    this.previsoes = dados.list;
                    this.organizarPrevisoesPorDia();
                } else {
                      alert('Por favor, digite o nome de uma cidade.');
  
                }
            } catch (erro) {
                console.error('Erro:', erro);
            }
        },
        // Método para obter previsão usando geolocalização
        async obterPrevisaoPorLocalizacao() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async position => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    try {
                        const resposta = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric&lang=pt_br`);
                        if (resposta.status === 200) {
                            const dados = await resposta.json();
                            this.previsoesPorDia = [[dados]];
                            this.detalhesDia = [{}];
                        } else {
                            console.error('Erro na requisição:', resposta.status);
                        }
                    } catch (erro) {
                        console.error('Erro:', erro);
                    }
                }, erro => {
                    console.error('Erro na geolocalização:', erro);
                });
            } else {
                console.error('Geolocalização não suportada pelo navegador.');
            }
        },
        // Método para organizar previsões por dia
        organizarPrevisoesPorDia() {
            const previsoesPorDia = {};
            this.previsoes.forEach(previsao => {
                const data = new Date(previsao.dt * 1000);
                const dia = new Date(data.getFullYear(), data.getMonth(), data.getDate());
                if (!previsoesPorDia[dia]) {
                    previsoesPorDia[dia] = [];
                }
                previsoesPorDia[dia].push(previsao);
            });
            this.previsoesPorDia = Object.values(previsoesPorDia);
            this.detalhesDia = this.previsoesPorDia.map(() => ({ mostrar: false }));
        },
        // Método para formatar data no formato "dd/mm/aaaa"
        formatarData(timestamp) {
            const data = new Date(timestamp * 1000);
            const dia = data.getDate().toString().padStart(2, '0');
            const mes = (data.getMonth() + 1).toString().padStart(2, '0');
            const ano = data.getFullYear();
            return `${dia}/${mes}/${ano}`;
        },
        // Método para formatar hora no formato "hh:mm"
        formatarHora(timestamp) {
            const data = new Date(timestamp * 1000);
            const hora = data.getHours().toString().padStart(2, '0');
            const minutos = data.getMinutes().toString().padStart(2, '0');
            return `${hora}:${minutos}`;
        },
        // Método para calcular temperatura máxima de um dia
        calcularTemperaturaMaxima(dia) {
            return Math.max(...dia.map(previsao => previsao.main.temp_max));
        },
        // Método para calcular temperatura mínima de um dia
        calcularTemperaturaMinima(dia) {
            return Math.min(...dia.map(previsao => previsao.main.temp_min));
        },
        // Método para calcular média de umidade de um dia
        calcularMediaUmidade(dia) {
            const somaUmidades = dia.reduce((soma, previsao) => soma + previsao.main.humidity, 0);
            return (somaUmidades / dia.length).toFixed(1);
        },
        // Método para calcular média de velocidade do vento de um dia
        calcularMediaVelocidadeVento(dia) {
            const somaVelocidades = dia.reduce((soma, previsao) => soma + previsao.wind.speed, 0);
            return (somaVelocidades / dia.length).toFixed(1);
        },
        // Método para obter o URL do ícone da condição
        obterIconeCondicao(icon) {
            return `http://openweathermap.org/img/w/${icon}.png`;
        },
        // Método para mostrar/ocultar detalhes de um dia
        mostrarDetalhesDia(indice) {
            this.detalhesDia = this.detalhesDia.map((detalhe, i) => ({ mostrar: i === indice }));
        },
        // Método para obter previsões a cada 3 horas de um dia
        obterPrevisoesACada3Horas(dia) {
            return dia.filter((previsao, index) => index % 1 === 0);
        }
    }
});
