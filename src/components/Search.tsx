import React, {useEffect, useState} from 'react';
import {Modal, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {EventStatus, RepositoryStatus} from "@/src/types/auth";

interface SearchFilterProps {
    data: any[];
    onFilteredDataChange: (filteredData: any[]) => void;
    searchFields: string[];
    filterConfig?: {
        repositoryStatus?: boolean;
        sessionStatus?: boolean;
        customFilters?: {
            key: string;
            label: string;
            options: { value: string; label: string }[];
        }[];
    };
    placeholder?: string;
    emptyMessage?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
                                                       data,
                                                       onFilteredDataChange,
                                                       searchFields,
                                                       filterConfig = {},
                                                       placeholder = "Buscar...",
                                                       emptyMessage = "No se encontraron resultados"
                                                   }) => {

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRepositoryStatus, setSelectedRepositoryStatus] = useState("all");
    const [selectedSessionStatus, setSelectedSessionStatus] = useState("booked");
    const [customFilters, setCustomFilters] = useState<Record<string, string>>({});
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filteredData, setFilteredData] = useState<any[]>([]);

    const repositoryStatusOptions = [
        { value: RepositoryStatus.ALL, label: "Todos" },
        { value: RepositoryStatus.SUBMITTED, label: "Enviado" },
        { value: RepositoryStatus.REVIEWED, label: "Revisado" },
        { value: RepositoryStatus.APPROVED, label: "Aprobado" },
        { value: RepositoryStatus.REJECTED, label: "Rechazado" }
    ];

    const sessionStatusOptions = [
        { value: EventStatus.ALL, label: "Todas" },
        { value: EventStatus.BOOKED, label: "Reservadas" },
        { value: EventStatus.AVAILABLE, label: "Disponibles" },
        { value: EventStatus.CANCELED, label: "Canceladas" }
    ];

    useEffect(() => {
        applyFilters();
    }, [searchQuery, selectedRepositoryStatus, selectedSessionStatus, customFilters, data]);

    const applyFilters = () => {
        let filtered = [...data];

        if (searchQuery.trim()) {
            filtered = filtered.filter(item => {
                return searchFields.some(field => {
                    const value = field.split('.').reduce((obj, key) => obj?.[key], item);
                    return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
                });
            });
        }

        if (filterConfig.repositoryStatus && selectedRepositoryStatus !== "all") {
            filtered = filtered.filter(item => item.repository?.status === selectedRepositoryStatus);
        }

        if (filterConfig.sessionStatus && selectedSessionStatus !== "all") {
            filtered = filtered.filter(item => item.status === selectedSessionStatus);
        }

        Object.entries(customFilters).forEach(([key, value]) => {
            if (value !== "all") {
                filtered = filtered.filter(item => item[key] === value);
            }
        });

        setFilteredData(filtered);
        onFilteredDataChange(filtered);
    };

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedRepositoryStatus("all");
        setSelectedSessionStatus("booked");
        setCustomFilters({});
        setShowFilterModal(false);
    };

    const hasActiveFilters = () => {
        return searchQuery.trim() !== "" ||
            selectedRepositoryStatus !== "all" ||
            selectedSessionStatus !== "booked" ||
            Object.values(customFilters).some(value => value !== "all");
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (searchQuery.trim()) count++;
        if (selectedRepositoryStatus !== "all") count++;
        if (selectedSessionStatus !== "booked") count++;
        count += Object.values(customFilters).filter(value => value !== "all").length;
        return count;
    };

    return (
        <View className="mb-4">
            <View className="flex-row gap-3">
                <View className="flex-1 flex-row items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
                    <Ionicons name="search" size={20} color="#6B7280" />
                    <TextInput
                        className="flex-1 ml-2 text-gray-800"
                        placeholder={placeholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {(filterConfig.repositoryStatus || filterConfig.sessionStatus || filterConfig.customFilters) && (
                    <TouchableOpacity
                        className="bg-black rounded-lg px-3 py-2 justify-center items-center relative"
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Ionicons name="filter" size={20} color="white" />
                        {getActiveFilterCount() > 0 && (
                            <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                                <Text className="text-white text-xs font-bold">{getActiveFilterCount()}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {hasActiveFilters() && (
                <View className="flex-row flex-wrap mt-2 gap-2">
                    {searchQuery && (
                        <View className="flex-row items-center bg-blue-100 rounded-full px-3 py-1">
                            <Text className="text-blue-800 text-sm">Buscar: "{searchQuery}"</Text>
                            <TouchableOpacity
                                className="ml-1"
                                onPress={() => setSearchQuery("")}
                            >
                                <Ionicons name="close" size={16} color="#1e40af" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {filterConfig.repositoryStatus && selectedRepositoryStatus !== "all" && (
                        <View className="flex-row items-center bg-purple-100 rounded-full px-3 py-1">
                            <Text className="text-purple-800 text-sm">Repo: {selectedRepositoryStatus}</Text>
                            <TouchableOpacity
                                className="ml-1"
                                onPress={() => setSelectedRepositoryStatus("all")}
                            >
                                <Ionicons name="close" size={16} color="#7e22ce" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {filterConfig.sessionStatus && selectedSessionStatus !== "booked" && (
                        <View className="flex-row items-center bg-green-100 rounded-full px-3 py-1">
                            <Text className="text-green-800 text-sm">Sesión: {selectedSessionStatus}</Text>
                            <TouchableOpacity
                                className="ml-1"
                                onPress={() => setSelectedSessionStatus("booked")}
                            >
                                <Ionicons name="close" size={16} color="#166534" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Custom filters */}
                    {filterConfig.customFilters?.map(filter => (
                        customFilters[filter.key] !== "all" && (
                            <View key={filter.key} className="flex-row items-center bg-orange-100 rounded-full px-3 py-1">
                                <Text className="text-orange-800 text-sm">
                                    {filter.label}: {customFilters[filter.key]}
                                </Text>
                                <TouchableOpacity
                                    className="ml-1"
                                    onPress={() => setCustomFilters(prev => ({ ...prev, [filter.key]: "all" }))}
                                >
                                    <Ionicons name="close" size={16} color="#c2410c" />
                                </TouchableOpacity>
                            </View>
                        )
                    ))}

                    <TouchableOpacity
                        className="flex-row items-center bg-gray-200 rounded-full px-3 py-1"
                        onPress={resetFilters}
                    >
                        <Text className="text-gray-700 text-sm">Limpiar filtros</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View className="flex-1 justify-end bg-black/70">
                    <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10 max-h-3/4">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold">Filtros</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Repository Status Filter */}
                        {filterConfig.repositoryStatus && (
                            <View className="mb-6">
                                <Text className="text-lg font-semibold mb-3">Estado del Repositorio</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {repositoryStatusOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            className={`px-4 py-2 rounded-full ${
                                                selectedRepositoryStatus === option.value
                                                    ? 'bg-blue-500'
                                                    : 'bg-gray-200'
                                            }`}
                                            onPress={() => setSelectedRepositoryStatus(option.value)}
                                        >
                                            <Text className={
                                                selectedRepositoryStatus === option.value
                                                    ? 'text-white font-medium'
                                                    : 'text-gray-700'
                                            }>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {filterConfig.sessionStatus && (
                            <View className="mb-6">
                                <Text className="text-lg font-semibold mb-3">Estado de la Sesión</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {sessionStatusOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            className={`px-4 py-2 rounded-full ${
                                                selectedSessionStatus === option.value
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-200'
                                            }`}
                                            onPress={() => setSelectedSessionStatus(option.value)}
                                        >
                                            <Text className={
                                                selectedSessionStatus === option.value
                                                    ? 'text-white font-medium'
                                                    : 'text-gray-700'
                                            }>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {filterConfig.customFilters?.map(filter => (
                            <View key={filter.key} className="mb-6">
                                <Text className="text-lg font-semibold mb-3">{filter.label}</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    <TouchableOpacity
                                        className={`px-4 py-2 rounded-full ${
                                            customFilters[filter.key] === "all"
                                                ? 'bg-orange-500'
                                                : 'bg-gray-200'
                                        }`}
                                        onPress={() => setCustomFilters(prev => ({ ...prev, [filter.key]: "all" }))}
                                    >
                                        <Text className={
                                            customFilters[filter.key] === "all"
                                                ? 'text-white font-medium'
                                                : 'text-gray-700'
                                        }>
                                            Todos
                                        </Text>
                                    </TouchableOpacity>
                                    {filter.options.map(option => (
                                        <TouchableOpacity
                                            key={option.value}
                                            className={`px-4 py-2 rounded-full ${
                                                customFilters[filter.key] === option.value
                                                    ? 'bg-orange-500'
                                                    : 'bg-gray-200'
                                            }`}
                                            onPress={() => setCustomFilters(prev => ({ ...prev, [filter.key]: option.value }))}
                                        >
                                            <Text className={
                                                customFilters[filter.key] === option.value
                                                    ? 'text-white font-medium'
                                                    : 'text-gray-700'
                                            }>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                                onPress={resetFilters}
                            >
                                <Text className="text-gray-700 font-medium">Limpiar todo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-blue-500 rounded-lg py-3 items-center"
                                onPress={() => setShowFilterModal(false)}
                            >
                                <Text className="text-white font-medium">Aplicar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SearchFilter;