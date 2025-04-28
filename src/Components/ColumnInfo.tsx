import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Button, Dialog } from 'react-native-ui-lib';

interface ColumnInfoProps {
    table: string;
    column: string;
    category: string;
    synonyms?: string;
}

const ColumnInfo: React.FC<ColumnInfoProps> = ({
    table,
    column,
    category,
    synonyms,
}) => {
    const [infoVisible, setInfoVisible] = useState(false);

    return (
        <>
            <TouchableOpacity onPress={() => setInfoVisible(true)}>
                <Text style={styles.infoIcon}>i</Text>

            </TouchableOpacity>
            <Dialog
                visible={infoVisible}
                onDismiss={() => setInfoVisible(false)}
                containerStyle={styles.dialogContainer}
            >
                <View style={styles.dialogContent}>
                    <Text style={styles.dialogTitle}>Column Information</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Table:</Text>
                        <Text style={styles.infoValue}>{table}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Column:</Text>
                        <Text style={styles.infoValue}>{column}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Category:</Text>
                        <Text style={styles.infoValue}>{category}</Text>
                    </View>
                    {synonyms && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Synonyms:</Text>
                            <Text style={styles.infoValue}>{synonyms}</Text>
                        </View>
                    )}
                    <Button
                        label="Close"
                        onPress={() => setInfoVisible(false)}
                        style={{ marginTop: 16 }}
                    />
                </View>
            </Dialog>
        </>
    );
};

const styles = StyleSheet.create({
    infoIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.$iconPrimary,
        color: Colors.$textDefault,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    dialogTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: Colors.$textDefault,
    },
    dialogContent: {
        padding: 10,
    },

    dialogContainer: {
        backgroundColor: Colors.$backgroundDefault,
        borderRadius: 12,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    infoLabel: {
        fontWeight: '600',
        color: Colors.$textDefault,
        width: 80,
    },
    infoValue: {
        flex: 1,
        color: Colors.$textDefault,
    },
});

export default ColumnInfo;