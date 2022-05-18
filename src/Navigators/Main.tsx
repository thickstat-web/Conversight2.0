
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import {  TAB_NAVIGATION } from '@/Constants/screens'
import TabNavigator from './Tabs'

const Stack = createStackNavigator()

const MainNav = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name={TAB_NAVIGATION} component={TabNavigator} />
        </Stack.Navigator>
    )
}

export default MainNav