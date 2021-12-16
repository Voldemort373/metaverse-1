[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-f059dc9a6f8d3a56e377f745f24479a46679e63a5d9fe6f495e02850cd0d8118.svg)](https://classroom.github.com/online_ide?assignment_repo_id=6412199&assignment_repo_type=AssignmentRepo)
# Introdução

A realidade virtual é uma ferramenta com bastante potencial para ser empregada no ensino de ciências, despertando o interesse de alunos por fenômenos que muitas vezes são representados de forma abstrata e não são fáceis de serem visualizados. No campo da Biologia não é diferente, tendo aplicações práticas desde cirurgias já realizadas com realidade aumentada, até o auxílio na aprendizagem através de modelos anatômicos 3D[1]. Ainda falando sobre a realidade virtual, o uso da tecnologia já é uma realidade em museus de todo o mundo, trazendo uma experiência ainda mais detalhista e enriquecedora para seus visitantes. Em Salvador, o Espaço Pierre Verger da Fotografia Baiana (Forte de Sta. Maria), traz diversas exposições que aconteceram ou que foram criadas especificamente para visitação através de Óculos de Realidade Virtual[2]. Mostras de Pierre Verger, Adenor Gondim e Hirosuke Kitamura, foram as primeiras a serem disponibilizadas ao público. Nesse contexto, surge a ideia do museu de cera da anatomia humana. Um espaço interativo que se propõe a utilizar a realidade virtual para trazer uma experiência realista a crianças de 6-10 anos que ainda estão tendo o seu primeiro contato com os órgãos do corpo humano, ajudando a despertar mais interesse e retratar de forma mais realista e potencializando o aprendizado.
A ideia é um aplicativo multiplataforma que não precisa de equipamentos de hardware sofisticados para ser utilizado. Um óculos VR Cardboard de papelão(Figura 1), que pode ser feito com o próprio smartphone ou adquirido por até R$ 20.00 nas lojas de varejo online[3], é suficiente para a experiência de imersão no museu. O museu conta com um acervo de 9 peças realistas da anatomia humana, das quais se destacam a reprodução do cérebro humano, detalhes do esqueleto dentre outros. O tour virtual foi pensado como uma experiência de imersão, sendo também possível utilizar seus óculos RV para visualizar outras perspectivas do ambiente.

![Figura 1 - Google Cardboard](https://arvr.google.com/cardboard/images/join-the-fold.jpg)
Figura 1 - Google Cardboard

# Técnicas Aplicadas

O museu foi construído utilizando o three.js[4], uma biblioteca JavaScript apoiada no WebGL que é bastante utilizada para criar e modelar objetos 3D e animações em um navegador web. A ferramenta foi escolhida pois além de ser open-source e ter uma boa documentação, tem suporte para o Webxr, permitindo a integração com o metaverso.

**1) Modelagem do Ambiente**

Para a construção do teto e do piso do nosso ambiente utilizamos duas instâncias do objeto do tipo THREE.PlaneGeometry, definindo o tamanho, rotacionando, transladando e adicionando cores nas posições dessa geometria. Carregamos uma textura e adicionamos a um THREE.MeshPhongMaterial e posteriormente adicionando a nossa cena um objeto do tipo THREE.Mesh, que foi instanciado passando essa geometria e o seu material.
Criamos uma matriz para definir em quais posições teríamos paredes, janelas ou a base utilizada para posicionarmos os órgãos. Para a criação das paredes, adicionamos à cena um THREE.Mesh composto por um THREE.BoxGeometry e um THREE.MeshPhongMaterial, carregando uma textura de mármore. Já para a criação das bases, adicionamos um THREE.Mesh composto por um THREE.BoxGeometry e um THREE.MeshPhongMaterial, carregando uma textura metalizada. Na criação das janelas adicionamos um THREE.Mesh composto por um  THREE.BoxGeometry e utilizamos um THREE.MeshBasicMaterial de cor ciano, transparente e opacidade baixa. A construção em formato de matriz foi escolhida pela versatilidade de adequação ao longo do projeto.

**2) Modelagem dos Órgãos**

Os orgãos foram adicionados através de modelos disponibilizados de forma gratuita no formato GLTF em plataformas como o Sketchfab[5]. A escolha de trabalhar prioritariamente com modelos do tipo GLTF foi por conta da simplicidade e da maior disponibilidade destes em relação aos OBJ. Com o cenário já construido, foi possível modificar a escala e a posição de cada órgão para dimensionar de forma real dentro do museu.

**3) Modelagem do Cenário**

Os objetos que compõem o cenário também foram adicionados através de modelos disponibilizados gratuitamente em formato GLTF em plataformas como o Sketchfab. Com o cenário já construído, adicionamos todos os objetos através de uma instância de um objeto do tipo GLTFLoader, no qual passamos o caminho do modelo baixado em nosso projeto e uma função para definirmos a posição, tamanho, nome e posteriormente a adição à cena. O GLTFLoader foi constrúido para evitar redundância no código.

**4) Iluminação da Cena**

Para a iluminação da cena do nosso projeto, adicionamos uma luz ambiente e três pontos de luz, duas posicionadas no lustre adicionado no teto do cenário e uma posicionada em uma luminária em cima da mesa. Para a luz ambiente instanciamos um objeto do tipo THREE.AmbientLight e para os pontos de luz adicionais, três instâncias de objetos do tipo THREE.PointLight. A escolha da iluminação do tipo THREE.PointLight, como o próprio nome diz, por ser um ponto de luz, assim podemos posicionar cada ponto estrategicamente para que cause a impressão de ser uma luz proveniente dos objetos citados acima, e por podermos definir/modificar a distância, decaimento e intensidade da iluminação.

**5) Integração com o Webxr - Realidade Virtual**

O WebXR[6] foi a ferramenta utilizada para que fosse possivel exibir o cenário do museu através do navegador, simulando a utilização de um dispositivo físico como por exemplo um óculos Cardboad, através da instalação de um plugin no browser. 

Através do Threejs, foi necessário importar o VRButton que é um botão que verifica se existe compatibilidade com VR e que caso a mesma exista, é através deste que a experiencia em VR é iniciada. No nosso museu, o tour também é iniciado dessa forma. Para isso, foi necessário ajustar também no código na função responsável pela animação, utilizando setAnimationLoop pois o mesmo é necessário para projetos com WebXR, além de ativar a flag de renderização XR.

A experiência de realidade virtual é uma imersão no metaverso através de um caminho predefinido que a câmera percorre no museu. Para isso, adicionamos ela a um grupo(THREE.Group) e construímos uma elipse que vai ser o caminho percorrido pela câmera em cada ciclo da animação. Durante o tour, é possível utilizar os óculos de realidade virtual para observar em qualquer direção do ambiente. A escolha por uma interação visual se deu por conta do custo do equipamento exigido para outras formas de interação utilizando os controles, além do tempo reduzido de aproximadamente 15 dias para entregar o projeto piloto 100% funcional.

# Referências
1 - Y. Zhao, X. Zhao, F. Dong, G. J. Clapworthy, N. Ersotelos and E. Liu, "WebGL-based interactive rendering of whole body anatomy for web-oriented visualisation of avatar-centered digital health data," 13th IEEE International Conference on BioInformatics and BioEngineering, 2013, pp. 1-4, doi: 10.1109/BIBE.2013.6701605.

2 - https://www.pierreverger.org/br/acervo-foto/espaco-pierre-verger-da-fotografia-baiana/exposicoes-virtuais.html

3 - https://pt.aliexpress.com/item/1005001802891012.html?src=google&src=google&albch=shopping&acnt=768-202-3196&slnk=&plac=&mtctp=&albbt=Google_7_shopping&isSmbAutoCall=false&needSmbHouyi=false&albcp=15209634902&albag=136314365704&trgt=296478572533&crea=pt1005001802891012&netw=u&device=c&albpg=296478572533&albpd=pt1005001802891012&gclid=Cj0KCQiAy4eNBhCaARIsAFDVtI3UuZ0mOehzlGGR6jxGm5UFUJ6jT2iFOd-X_661FOceQfpH54KPZhwaAj5VEALw_wcB&gclsrc=aw.ds&aff_fcid=e311450ee9f14efe9b25d6fd6fcc8ba7-1638046763931-01519-UneMJZVf&aff_fsk=UneMJZVf&aff_platform=aaf&sk=UneMJZVf&aff_trace_key=e311450ee9f14efe9b25d6fd6fcc8ba7-1638046763931-01519-UneMJZVf&terminal_id=fcc5ecbcb4684084b8b53401a7c79af4

4 - https://threejs.org/

5 - https://sketchfab.com/

6 - https://immersive-web.github.io/
