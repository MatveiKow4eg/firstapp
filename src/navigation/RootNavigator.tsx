import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AgreementsListScreen from '../screens/AgreementsListScreen';
import AgreementEditScreen from '../screens/AgreementEditScreen';

// Тип параметров стека: главный список и экран создания/редактирования договорённости
export type RootStackParamList = {
  AgreementsList: undefined;
  AgreementEdit: { id?: string } | undefined; // если id есть — редактируем, если нет — создаём
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Корневой навигатор приложения: описывает, какие экраны есть и в каком стеке они находятся
const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AgreementsList" component={AgreementsListScreen} options={{ title: 'Договорённости' }} />
      <Stack.Screen
        name="AgreementEdit"
        component={AgreementEditScreen}
        options={{ title: 'Договорённость' }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
