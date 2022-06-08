import { View, Text, Hint } from 'react-native-ui-lib'
import React from 'react'
import ReqIcon from "@/Assets/Images/iconsSVG/req-demo.svg"
import { useTheme } from '@/Hooks'
import { Dimensions, KeyboardAvoidingView, ScrollView, TextInput, Platform } from 'react-native'
import { useForm, Controller, FieldValues } from 'react-hook-form'
import { ReqDemoForm } from '@/Types/Forms'
import { Button } from '@/Components'
import { NavigationProp, ParamListBase } from '@react-navigation/native'
import { DEMO_REQUESTED } from '@/Constants/screens'
import InputError from '@/Components/InputError'
import { EMAIL_REGEX } from '@/Constants/utils'

interface Props {
    navigation: NavigationProp<ParamListBase>
}

const RequestDemoContainer = ({ navigation }: Props) => {
    const { height: screenHeight } = Dimensions.get("screen")
    const { Layout, Fonts, Common, Colors } = useTheme()

    const { control, handleSubmit, formState: { errors }, } = useForm<ReqDemoForm>()

    console.log(errors)

    const onSubmit = (data: FieldValues) => {
        // toDo some API call for requesting a demo

        navigation.navigate(DEMO_REQUESTED)
    };

    const errorName =
        errors.name
            ? { borderColor: Colors.DARK_BLUE, color: Colors.DARK_BLUE }
            : {}

    const errorOrg =
        errors.organization
            ? { borderColor: Colors.DARK_BLUE, color: Colors.DARK_BLUE }
            : {}

    const errorEmail =
        errors.email
            ? { borderColor: Colors.DARK_BLUE, color: Colors.DARK_BLUE }
            : {}

    const errorPhone =
        errors.phone
            ? { borderColor: Colors.DARK_BLUE, color: Colors.DARK_BLUE }
            : {}

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} enabled keyboardVerticalOffset={100} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView>
                <View style={{ ...Layout.colCenter, flex: 1, paddingVertical: 70, }} >
                    <View style={{ height: screenHeight / 6 }}>
                        <ReqIcon />
                    </View>
                    <View style={{ height: screenHeight / 6 }}>
                        {/* <Text center marginV-10 style={{ ...Fonts.titleSmall, fontSize: 24 }}>Request a Demo</Text> */}
                        <Text center marginH-40 style={Fonts.textSmall}>If you would like a demo of ConverSight, please fill in this form and one of our representatives will be in touch with you soon.</Text>
                    </View>
                    <View flex-4>
                        
                        {errors.name?.message && <InputError errorText={errors.name?.message} />}

                        <Controller control={control}
                            rules={{
                                required: "Name is required",
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    onBlur={onBlur}
                                    value={value}
                                    onChangeText={onChange}
                                    style={{
                                        ...Common.textInput,
                                        ...errorName,
                                        marginVertical: 5,
                                    }}
                                    placeholder="Your name" />
                            )} name={'name'} />

                        {errors.organization?.message && <InputError errorText={errors.organization?.message} />}

                        <Controller control={control}
                            rules={{
                                required: "Organization is required",
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    onBlur={onBlur}
                                    value={value}
                                    onChangeText={onChange}
                                    style={{
                                        ...Common.textInput,
                                        ...errorOrg,
                                        marginVertical: 5
                                    }}
                                    placeholder="Your Organization"
                                />
                            )} name="organization" />

                        {errors.email?.message && <InputError errorText={errors.email?.message} />}

                        <Controller control={control}
                            rules={{
                                required: "Email is required",
                                pattern: {
                                    value: EMAIL_REGEX,
                                    message: "Invalid email address"
                                }
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    keyboardType="email-address"
                                    onBlur={onBlur}
                                    value={value}
                                    onChangeText={onChange}
                                    style={{
                                        ...Common.textInput,
                                        ...errorEmail,
                                        marginVertical: 5
                                    }}
                                    placeholder="Your Email" />
                            )} name={'email'}
                        />

                        {errors.phone?.message && <InputError errorText={errors.phone?.message} />}

                        <Controller control={control}
                            rules={{
                                required: "Phone is required",
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    keyboardType='phone-pad'
                                    onBlur={onBlur}
                                    value={value}
                                    onChangeText={onChange}
                                    style={{
                                        ...Common.textInput,
                                        ...errorPhone,
                                        marginVertical: 5,
                                        marginBottom: 10
                                    }}
                                    placeholder="Your Phone Number" />
                            )} name={'phone'} />

                        <Button block dark label='Request a Demo' onPress={handleSubmit(onSubmit)} />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView >
    )
}

export default RequestDemoContainer