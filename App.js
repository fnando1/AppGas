import React, {Component} from "react";
import {View, Text, Image} from 'react-native';

class App extends Component{
  render(){

    let nome = 'Faça seu Pedido.';
    let img = 'https://www.utilgas.com.br/img/1692110854.1204-foto_banner-N.webp'

    return(
      <View>
        <Text style={{color: '#074F8C', fontSize: 25, margin: 20}} >
          AppGas
        </Text>
        <Text>Entrega Rapida</Text>
        <text>Entregamos na região norte de Manaus.</text>

        <Image 
          source={{uri:img}}
          style={{width:300, height: 300}}
        />

        <Text style={{fontSize:30}} >{nome}</Text>

      </View>
    );
  }
}

export default App;